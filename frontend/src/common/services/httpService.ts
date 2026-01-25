import apiClient from '@/common/services/apiClient';

interface Entity {
  id: string | number;
}

export abstract class BaseHttpService<T> {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  protected buildUrl = (path: string = ''): string => `${this.endpoint}${path}`;

  getAll = (): Promise<T[]> =>
    apiClient.get<T[]>(this.endpoint).then((res) => res.data);
  get = (id: string | number): Promise<T> =>
    apiClient.get<T>(`${this.endpoint}/${id}`).then((res) => res.data);
  create = (entity: Omit<T, 'id'>): Promise<T> =>
    apiClient.post<T>(this.endpoint, entity).then((res) => res.data);
  update = (id: string | number, updates: Partial<T>): Promise<T> =>
    apiClient
      .patch<T>(`${this.endpoint}/${id}`, updates)
      .then((res) => res.data);
  delete = (id: string | number): Promise<void> =>
    apiClient.delete(`${this.endpoint}/${id}`).then((res) => res.data);
}

export class HttpService<T> extends BaseHttpService<T> {
  constructor(endpoint: string) {
    super(endpoint);
  }
}

export class TransformedHttpService<TDomain, TApi> {
  private endpoint;
  private toApi: (domain: TDomain) => TApi;
  private fromApi: (api: TApi) => TDomain;

  constructor(
    endpoint: string,
    fromApi: (domain: TApi) => TDomain,
    toApi: (api: TDomain) => TApi
  ) {
    this.endpoint = endpoint;
    this.toApi = toApi;
    this.fromApi = fromApi;
  }

  getAll = async () => {
    const response = await apiClient.get<TApi[]>(this.endpoint);
    return response.data.map(this.fromApi);
  };

  get = async (id: string | number): Promise<TDomain> => {
    const response = await apiClient.get<TApi>(this.endpoint + '/' + id);
    return this.fromApi(response.data);
  };

  create = async (entity: Omit<TDomain, 'id'>): Promise<TDomain> => {
    const apiEntity = this.toApi(entity as TDomain);
    const response = await apiClient.post<TApi>(this.endpoint, apiEntity);
    return this.fromApi(response.data);
  };

  update = async (
    id: string | number,
    updates: Partial<TDomain>
  ): Promise<TDomain> => {
    const apiUpdates = this.toApi(updates as TDomain);
    const response = await apiClient.patch<TApi>(
      `${this.endpoint}/${id}`,
      apiUpdates
    );
    return this.fromApi(response.data);
  };

  delete = async (id: string | number): Promise<void> => {
    await apiClient.delete(`${this.endpoint}/${id}`);
  };
}
