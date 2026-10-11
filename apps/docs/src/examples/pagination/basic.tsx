import { useState } from "react";
import { Pagination } from "@heigin/ui";

export default function PaginationBasic() {
  const [page, setPage] = useState(1);
  return <Pagination page={page} pageSize={25} totalItems={1342} onPageChange={setPage} />;
}
