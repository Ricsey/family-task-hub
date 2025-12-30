import apiClient from '@/common/services/apiClient';

interface Entity {
  id: string | number
}

export class HttpService<T> {
  private endpoint;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  getAll = () => {
    return apiClient.get<T[]>(this.endpoint).then(res => res.data);
  }

  get = async (id: string | number): Promise<T> => {
    return apiClient.get<T>(this.endpoint + '/' + id).then(res => res.data);
  }

  create = (entity: Omit<T, 'id'>) => {
    return apiClient.post<T>(this.endpoint, entity).then(res => res.data)
  }

  update = (entity: Entity & Partial<T>) => {
    return apiClient.patch<T>(this.endpoint + '/' + entity.id, entity).then(res => res.data)
  }

  delete = (id: string | number) => {
    return apiClient.delete<void>(this.endpoint + '/' + id).then(res => res.data)
  }
}
