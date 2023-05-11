import React, { useParams } from "react-router-dom";

export function routeAdapter(Component) {
  const displayName = `routeAdapter(${Component.displayName || Component.name})`;
  const C = (props) => {
    const match = { params: useParams() };
    return <Component {...props} match={match} />;
  };
  C.displayName = displayName;
  C.WrappedComponent = Component;

  return C;
}
