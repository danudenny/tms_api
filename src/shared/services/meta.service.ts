export class MetaService {

  public static set(page: number, limit: number, total: number) {
    const totalPage = Math.ceil(total / limit);

    return {
      current_page: page,
      next_page: page < totalPage ? page + 1 : 0,
      prev_page: page - 1,
      total_pages: totalPage,
      total_count: total,
      status: 'OK',
      limit,
    };
  }
}
