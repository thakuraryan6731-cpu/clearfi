const { createClient } = require("@supabase/supabase-js");
const { extractTextFromPdf } = require("../services/documentExtractor");

const createUserSupabase = (token) => {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
};

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No document uploaded",
      });
    }

    const userId = req.user.id;
    const file = req.file;

    // Get token from Authorization header
    const token = req.headers.authorization.split(" ")[1];

    // Create Supabase client using the user's JWT
    const supabase = createUserSupabase(token);

    const filePath = `${userId}/${Date.now()}-${file.originalname}`;

    // Upload file to Supabase Storage
    console.log("STEP 1: Uploading file to Storage");

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    console.log("STEP 1 SUCCESS: File uploaded to Storage");

    // Save document information in database
    console.log("STEP 2: Inserting document into database");

    const { data, error: dbError } = await supabase
      .from("documents")
      .insert({
        user_id: userId,
        file_name: file.originalname,
        file_path: filePath,
        document_type: "unknown",
        status: "uploaded",
      })
      .select()
      .single();

    if (dbError) {
      // Remove uploaded file if database insert fails
      await supabase.storage
        .from("documents")
        .remove([filePath]);

      throw dbError;
    }

    console.log("STEP 2 SUCCESS: Document inserted into database");

    // Extract text from PDF
    const extracted = await extractTextFromPdf(file.buffer);

    console.log("Document extracted successfully");
    console.log("Pages:", extracted.pages);
    console.log("Characters:", extracted.text.length);

    // Update document status
    const { error: updateError } = await supabase
      .from("documents")
      .update({
        status: "processing",
      })
      .eq("id", data.id);

    if (updateError) {
      throw updateError;
    }

    return res.status(201).json({
      success: true,
      message: "Document uploaded and text extracted successfully",
      data: {
        document: data,
        extractedText: extracted.text,
        pages: extracted.pages,
      },
    });
  } catch (error) {
    console.error("Upload document error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to upload document",
      error: error.message,
    });
  }
};

module.exports = {
  uploadDocument,
};
