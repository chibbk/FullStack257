import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet("/deletePost")
public class DeletePostServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession(false);
        User currentUser = (session != null) ? (User) session.getAttribute("currentUser") : null;
        if (currentUser == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Not logged in.");
            return;
        }

        String idStr = request.getParameter("id");  // expecting ?id=123
        if (idStr == null || idStr.isBlank()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing post id.");
            return;
        }

        try {
            long postId = Long.parseLong(idStr);

            PostDAO postDAO = new PostDAOImpl();
            boolean deleted = postDAO.deletePost(postId, currentUser.getId());

            if (!deleted) {
                // either post doesn't exist or doesn't belong to user
                response.sendError(HttpServletResponse.SC_FORBIDDEN,
                        "You are not allowed to delete this post.");
                return;
            }

            // after delete, go back to feed
            response.sendRedirect(request.getContextPath() + "/home.html");

        } catch (NumberFormatException e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid post id.");
        } catch (Exception e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Server error while deleting post.");
        }
    }
}
