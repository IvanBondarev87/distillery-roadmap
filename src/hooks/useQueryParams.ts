import { useLocation } from 'react-router-dom';
import qs from 'query-string';

function useQueryParams() {
  const { search } = useLocation();
  return qs.parse(search, {
    parseNumbers: true,
    parseBooleans: true,
  });
}

export default useQueryParams;
