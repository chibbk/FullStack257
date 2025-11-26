import java.util.List;

public class TestPostDAO {

    public static void main(String[] args) {
        try {
        	
            PostDAO postDAO = new PostDAOImpl();

            // Assume there is a user with id = 1 in the database
            Post p = new Post(1, "My first post", "Hello AUS Social!", "Question");
            p.setTags("aus,social,test");
            p.setLocation("Student Center");

            boolean created = postDAO.createPost(p);
            System.out.println("Post created? " + created + " | id = " + p.getId());

            // Fetch by ID
            Post fetched = postDAO.findById(p.getId());
            System.out.println("Fetched: " + fetched);

            // Fetch feed
            List<Post> feed = postDAO.findAllForFeed();
            System.out.println("Feed size = " + feed.size());
            for (Post post : feed) {
                System.out.println(post);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
