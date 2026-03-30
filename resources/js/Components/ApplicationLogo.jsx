export default function ApplicationLogo(props) {
    const { className = '', ...restProps } = props;

    return (
        <div
            {...restProps}
            className={`inline-flex items-center gap-2 text-indigo-600 ${className}`}
        >
            <span className="text-2xl leading-none">🛍️</span>
        </div>
    );
}
