import type { ReactNode, FC } from "react";

interface Props {
  children: ReactNode;
}

const PublicRoute: FC<Props> = ({ children }) => {
  return <>{children}</>;
};

export default PublicRoute;