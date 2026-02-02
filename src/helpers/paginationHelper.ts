type IOptions = {
    page? : number | string,
    limit? : number | string,
    sortBy? : string,
    orderBy? : string
}

type OOptions = {
     page: number;
        limit: number;
        skip: number;
        sortBy: string;
        orderBy:string;
}


const paginationSortHelper = (options: IOptions):OOptions => {
    const page:number = Number(options.page ?? 1);
    const limit: number = Number(options.limit ?? 10);
    const skip:number = (page-1)*limit;


    // sorting options
    const sortBy: string = options.sortBy || 'createdAt';
    const orderBy : string = options.orderBy || 'desc';

    return {
        page,
        limit, 
        skip,
        sortBy,
        orderBy
    }
}




export default paginationSortHelper;