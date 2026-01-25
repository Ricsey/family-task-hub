import { HttpService } from '@/common/services/httpService';
import type { Member } from '../types/members';

class MemberService extends HttpService<Member> {
  constructor() {
    super('/users'); //TODO: /members would be better?
  }
}

export const memberService = new MemberService();
