import { HttpService } from '@/common/services/httpService';
import type { Member } from '../types/members';

class MemberService extends HttpService<Member> {
  constructor() {
    super('/users'); //TODO: /members would be better?
  }

  override getAll = async (): Promise<Member[]> => {
    //TODO: Mocked data until we have members in backend!
    return [
      { id: '1', name: 'Mom' },
      { id: '2', name: 'Dad' },
      { id: '3', name: 'Kid 1' },
    ];
  };
}

export const memberService = new MemberService();
