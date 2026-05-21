export type OracleSpec = {
  id: string;
  description?: string;
  admin: {
    method?: 'GET' | 'POST';
    path: string;
    query?: Record<string, string>;
    body?: Record<string, string>;
    response: {
      valuePath?: string;
      itemsPath?: string;
      matchField?: string;
    };
  };
};
