export type ErrorRouteProps = {
  error: Error & { digest?: string };
  reset: () => void;
};
