import React from 'react';

/**
 * 
 * @param {Object} props
 *  @param {Array<Array>} props.matrix
 *  @param {Boolean} props.isBool
 *  @param {Function} props.onChange 
 *  @param {Boolean} props.editable
 *  @param {String} props.descr
 */
function TableComponent(props) {
  const tableEl = React.useRef();
  
  function handleChange(ev, u, v) {
    if (!props.isBool) {
      props.onChange ? props.onChange(ev.target.textContent ? parseInt(ev.target.textContent) : 0, u, v) : null;
    } else {
      props.onChange ? props.onChange(ev.target.checked, u, v) : null;
    }
  }

  return (
    <table className={["table-container", (props.isBool ? "bool-table" : "")].join(" ")} ref={ tableEl }>
      <caption>{props.descr}</caption>
      <thead>
        <tr className="table-row table-first-row">
          <td className="table-cell table-empty-cell table-header-cell"></td>
          { props.matrix.map((row, rIndex) => (
            <td key={ rIndex } className="table-cell table-header-cell">{ rIndex + 1 }</td>
          ))

          }
        </tr>
      </thead>
      <tbody>
        {props.matrix.map((row, rIndex) => (
          <tr key={ rIndex } className={["table-row"].join(" ")}>
            <td className="table-cell table-first-cell">{ rIndex + 1 }</td>
            { [...row].map((cell, cIndex) => rIndex != cIndex ? (
              props.isBool ? (
                <td key={ cIndex } className="table-cell" onBlur={ (ev) => handleChange(ev, rIndex, cIndex) }>
                  {/* <Checkbox color="primary" size={ "small" } checked={ cell } onChange={ (ev) => handleChange(ev, rIndex, cIndex) } /> */}
                  <input className={ !props.editable && cell ? "checked" : "" } disabled={ !props.editable } checked={ cell } onChange={ (ev) => handleChange(ev, rIndex, cIndex) } type="checkbox"></input>
                </td> 
              ) : (
              <td key={ cIndex } className="table-cell" onBlur={ (ev) => handleChange(ev, rIndex, cIndex) } suppressContentEditableWarning={true} contentEditable={ props.editable }>{ cell }</td>
              )
            ) : (
              <td key={ cIndex } className="table-cell table-empty-cell" />
            ))
            }
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TableComponent;