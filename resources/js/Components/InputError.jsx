export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p {...props} className={'msg-error pt-1 ' + className}>
            {message}
        </p>
    ) : null;
}
