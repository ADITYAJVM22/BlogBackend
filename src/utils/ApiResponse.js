class ApiResponse{
    constructor(
        statusCode,
        data,
        message="Default success"
    ){
        this.statusCode=statusCode;
        this.data=data;
        this.message=message;
        this.success=statusCode<400 //otherwise its error
    }
}
export {ApiResponse}