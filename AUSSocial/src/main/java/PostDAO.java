import java.util.List;

public interface PostDAO {

    boolean createPost(Post post) throws Exception;

    Post findById(long id) throws Exception;

    List<Post> findByUser(int userId) throws Exception;

    List<Post> findAllForFeed() throws Exception;  // e.g. newest first

    boolean deletePost(long postId, int userId) throws Exception;
}
