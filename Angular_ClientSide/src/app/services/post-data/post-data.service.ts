import { Injectable } from '@angular/core';
import { Post } from 'src/app/components/posts/data-type/post.model';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment'
 
const BACKEND_URL = environment.apiURL + "/posts/";

@Injectable({
  providedIn: 'root'
})
export class PostDataService {

  private posts: Post[] = [];
  private postsUpdated = new Subject<{ post: Post[], postCount: number }>();

  constructor(private http: HttpClient, private router: Router) { }

  // GET : fetch posts from backend
  getPosts(pageSize: number, currentPage: number) {

    // query to handle pagination feature from backend
    const queryParams = `?pageSize=${pageSize}&currentPage=${currentPage}`;

    // get posts from backend
    this.http.get<{ message: string, posts: any, maxPosts: number }>(BACKEND_URL + queryParams)
      .pipe(map((postData) => {
        return {
          posts: postData.posts.map(post => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator
            };
          }),
          maxPosts: postData.maxPosts
        };
      }))
      .subscribe((transformedPostData) => {
        console.log(transformedPostData);

        this.posts = transformedPostData.posts;
        this.postsUpdated.next({ post: [...this.posts], postCount: transformedPostData.maxPosts });
      });

  }

  // maintaining an observable var to store posts
  getPostsUpdateListener() {
    return this.postsUpdated.asObservable();
  }


  // CREATE : adding posts to the backend
  addPosts(title: string, content: string, image: File) {

    //setting postData
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);


    // adding posts to backend
    this.http.post<{ message: string, post: Post }>(BACKEND_URL, postData)
      .subscribe((responseData) => {
        this.router.navigate(["/"]);
      });

  }

  // DELETE : deleting posts from the backend
  deletePost(postId) {
    return this.http.delete(BACKEND_URL + postId);
  }

  // EDIT (get) : fetch post for editing
  getEditablePost(id: string) {
    // return {...this.posts.find(p => p.id === id)};
    return this.http.get<{ _id: string, title: string, content: string, imagePath: string, creator: string }>(BACKEND_URL + id);
  }

  // EDIT (put) : edit post on the backend
  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;

    if (typeof image === 'object') {

      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);

    } else {
      postData = { id: id, title: title, content: content, imagePath: image, creator: null};
    }

    this.http.put(BACKEND_URL + id, postData)
      .subscribe((responseData) => {
        console.log(responseData);
        this.router.navigate(["/"]);
      });
  }

}
