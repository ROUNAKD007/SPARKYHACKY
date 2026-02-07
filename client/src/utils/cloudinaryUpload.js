const CLOUD_NAME = 'dqtvgswhd';
const UPLOAD_PRESET = 'luminous_unsigned';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export const uploadImages = async (files) => {
    if (!files || files.length === 0) {
        throw new Error('No files selected');
    }

    const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        let response;
        try {
            response = await fetch(CLOUDINARY_UPLOAD_URL, {
                method: 'POST',
                body: formData,
            });
        } catch (error) {
            throw new Error(`Cloudinary upload failed: ${error.message}`);
        }

        if (!response.ok) {
            let errData = {};
            try {
                errData = await response.json();
            } catch {
                // no-op
            }
            throw new Error(errData.error?.message || 'Cloudinary upload failed');
        }

        const data = await response.json();
        return {
            url: data.secure_url,
            publicId: data.public_id,
            width: data.width,
            height: data.height,
        };
    });

    return Promise.all(uploadPromises);
};
