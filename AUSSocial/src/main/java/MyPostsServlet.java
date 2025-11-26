import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet("/myPosts")
public class MyPostsServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");

        HttpSession session = request.getSession(false);
        User currentUser = (session != null) ? (User) session.getAttribute("currentUser") : null;
        if (currentUser == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            try (PrintWriter out = response.getWriter()) {
                out.write("{\"error\":\"Not logged in\"}");
            }
            return;
        }

        try (PrintWriter out = response.getWriter()) {
            PostDAO postDAO = new PostDAOImpl();
            List<Post> posts = postDAO.findByUser(currentUser.getId());

            StringBuilder sb = new StringBuilder();
            sb.append("[");

            for (int i = 0; i < posts.size(); i++) {
                Post p = posts.get(i);
                if (i > 0) sb.append(",");

                sb.append("{")
                  .append("\"id\":").append(p.getId()).append(",")
                  .append("\"title\":").append(json(p.getTitle())).append(",")
                  .append("\"body\":").append(json(p.getBody())).append(",")
                  .append("\"category\":").append(json(p.getCategory())).append(",")
                  .append("\"likeCount\":").append(p.getLikeCount())
                  .append("}");
            }

            sb.append("]");
            out.write(sb.toString());

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            try (PrintWriter out = response.getWriter()) {
                out.write("{\"error\":\"Server error\"}");
            }
        }
    }

    private String json(String s) {
        if (s == null) return "null";
        return "\"" + s
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r") + "\"";
    }
}
