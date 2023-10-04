import { Request, Response, NextFunction } from "express";

interface Post {
  userId: Number;
  id: Number;
  title: String;
  body: String;
}

// getting all posts
const getPosts = async (req: Request, res: Response, next: NextFunction) => {
  // get some posts
  // let result: AxiosResponse = await axios.get(`https://service.pielow.io/posts`);
  // let posts: [Post] = result.data;
  return res.status(200).json({
    message: "NEW MESSAGE",
  });
};

export default { getPosts };
