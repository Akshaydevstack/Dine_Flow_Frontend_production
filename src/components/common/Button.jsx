import React from 'react';
export default function Button({children, ...rest}){
  return <button {...rest} className="px-3 py-1 rounded bg-blue-600 text-white">{children}</button>;
}
