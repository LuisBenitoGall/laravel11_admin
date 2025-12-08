export default function PrimaryButton({ className = '', disabled = false, loading = false, loadingText = 'guardando', children, ...props }) {
    const isDisabled = disabled || loading;

    return (
        <button
            {...props}
            className={
                `btn btn-primary text-white ${
                    isDisabled && 'opacity-25'
                } ` + className
            }
            disabled={isDisabled}
        >
            {loading && (
                <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                />
            )}
            {loading ? (loadingText + '...') : children}
        </button>
    );
}
