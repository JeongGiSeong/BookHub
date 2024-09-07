import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminGuard } from 'src/auth/gurads/admin.guard';
import { ReviewService } from '../review.service';

@Injectable()
export class ReviewGuard extends AdminGuard {
  constructor(
    private reviewService: ReviewService,
    reflector: Reflector
  ) {
    super(reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 관리자 권한이 있는지 확인
    if (super.canActivate(context)) {
      return true;
    }

    // 작성자 본인인지 확인
    const review = await this.reviewService.findById(request.params.id);
    return review && review.user.toString() === user._id.toString();
  }
}
