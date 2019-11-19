import { ApiModelProperty } from '../external/nestjs-swagger';
import { MetaService } from '../services/meta.service';

export class BaseMetaResponsePaginationVm {
  @ApiModelProperty()
  currentPage: number;

  @ApiModelProperty()
  nextPage: number;

  @ApiModelProperty()
  prevPage: number;

  @ApiModelProperty()
  totalPage: number;

  @ApiModelProperty()
  totalData: number;

  @ApiModelProperty()
  limit: number;
}

export class BaseMetaResponseVm {
  @ApiModelProperty({ type: () => BaseMetaResponsePaginationVm })
  paging: BaseMetaResponsePaginationVm = new BaseMetaResponsePaginationVm();

  buildPaging(page: number, limit: number, total: number) {
    const { currentPage, nextPage, prevPage, totalPage } = MetaService.set(
      page,
      limit,
      total,
    );
    this.paging.currentPage = currentPage;
    this.paging.nextPage = nextPage;
    this.paging.prevPage = prevPage;
    this.paging.totalPage = totalPage;
    this.paging.totalData = total;
    this.paging.limit = limit;
  }
}
