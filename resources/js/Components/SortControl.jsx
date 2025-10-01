export function SortControl({
    name,
    sortable = true,
    sort_field = null,
    sort_direction = null,
    sortChanged = () => {},
    children
}){
    const handleSortChange = () => {
        if (sortable) {
            sortChanged(name);
        }
    };

    return(
        <div className="d-inline-block float-end" onClick={handleSortChange}>
            <span className="float-end cursor-pointer">
                {sort_field === name && sort_direction === 'asc' ? (
                    <i className="la la-sort-alpha-down"></i>
                ) : sort_field === name && sort_direction === 'desc' ? (
                    <i className="la la-sort-alpha-up-alt"></i>
                ) : (
                    <i className="la la-sort"></i> // Icono neutral cuando no está ordenado
                )}
            </span>
        </div>
    )
}