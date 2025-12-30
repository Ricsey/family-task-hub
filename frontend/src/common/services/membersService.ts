import { HttpService } from '@/common/services/httpService';
import type { Member } from '../types/members';

class MemberService extends HttpService<Member> {
  constructor() {
    super('/users'); //TODO: /members would be better?
  }

  override getAll = async (): Promise<Member[]> => {
    return [
      { id: '1', name: 'Mom' },
      { id: '2', name: 'Dad' },
      { id: '3', name: 'Kid 1' },
    ];
  };
}

//TODO: Mock, cause there are no members in database!

export const memberService = new MemberService();
