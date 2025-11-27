import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/feed")
public class FeedServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");

        try (PrintWriter out = response.getWriter()) {
            PostDAO postDAO = new PostDAOImpl();
            List<Post> posts = postDAO.findAllForFeed();

            StringBuilder sb = new StringBuilder();
            sb.append("[");

            for (int i = 0; i < posts.size(); i++) {
                Post p = posts.get(i);
                if (i > 0) sb.append(",");

                sb.append("{")
                  .append("\"id\":").append(p.getId()).append(",")
                  .append("\"userId\":").append(p.getUserId()).append(",")
                  .append("\"title\":").append(json(p.getTitle())).append(",")
                  .append("\"body\":").append(json(p.getBody())).append(",")
                  .append("\"category\":").append(json(p.getCategory())).append(",");

                if (p.getPrice() != null) {
                    sb.append("\"price\":").append(p.getPrice()).append(",");
                }
                
                if (p.getEventDate() != null) {
                    sb.append("\"eventDate\":")
                      .append(json(p.getEventDate().toString()))
                      .append(",");
                }
                if (p.getEventTime() != null) {
                    sb.append("\"eventTime\":")
                      .append(json(p.getEventTime().toString()))
                      .append(",");
                }
                
                sb.append("\"location\":").append(json(p.getLocation())).append(",")
                  .append("\"building\":").append(json(p.getBuilding())).append(",")
                  .append("\"tags\":").append(json(p.getTags())).append(",")
                  .append("\"likeCount\":").append(p.getLikeCount()).append(",")
                  .append("\"createdAt\":").append(json(
                        p.getCreatedAt() != null ? p.getCreatedAt().toString() : null))
                  .append("}");
            }

            sb.append("]");
            out.write(sb.toString());

        } catch (Exception e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Error loading feed.");
        }
    }

    // Simple JSON string helper
    private String json(String s) {
        if (s == null) return "null";
        return "\"" + s
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r") + "\"";
    }
}
