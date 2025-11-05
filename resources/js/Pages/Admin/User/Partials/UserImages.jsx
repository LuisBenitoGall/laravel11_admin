import React from 'react';
import DropzoneGallery from '@/Components/DropzoneGallery';

export default function UserImages({ images = [], uploadUrl = null, deleteUrl = null, onChange = () => {}, entityId = null, imagePath = null }) {
    // images: array of objects { id, url, name }

    const handleChange = (nextImages) => {
        // bubble up
        if (typeof onChange === 'function') onChange(nextImages);
    };

    return (
        <div className="col-12 gy-2">
            <DropzoneGallery
                existingImages={images}
                imagePath={imagePath}
                uploadUrl={uploadUrl}
                deleteUrl={deleteUrl}
                entityId={entityId}
                uploadParamName={'file'}
                maxFiles={20}
                maxFileSize={3 * 1024 * 1024}
                acceptedTypes={['image/jpeg','image/png','image/gif','image/webp']}
                onChange={handleChange}
                autoUpload={true}
            />
        </div>
    );
}
