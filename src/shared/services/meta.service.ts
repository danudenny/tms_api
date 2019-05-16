export class MetaService {

  public static set(page: number, limit: number, total: number) {
    const totalPage = Math.ceil(total / limit);

    return {
      currentPage: page,
      nextPage: page < totalPage ? page + 1 : 0,
      prevPage: page - 1,
      totalPage,
      totalData: total,
      limit,
    };
  }
}
