import java.io.IOException;
import java.io.PrintWriter;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet("/updateBio")
public class UpdateBioServlet extends HttpServlet {

    private final UserDAO userDao = new UserDAOImpl();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json;charset=UTF-8");

        HttpSession session = request.getSession(false);
        User current = (session != null)
                ? (User) session.getAttribute("currentUser")
                : null;

        if (current == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            try (PrintWriter out = response.getWriter()) {
                out.write("{\"ok\":false,\"error\":\"not_logged_in\"}");
            }
            return;
        }

        String bio = request.getParameter("bio");
        if (bio == null) bio = "";

        // optional: limit length
        if (bio.length() > 1000) {
            bio = bio.substring(0, 1000);
        }

        try (PrintWriter out = response.getWriter()) {
            boolean ok = userDao.updateBio(current.getId(), bio);
            if (ok) {
                // update session user so whoami sees fresh value
                current.setBio(bio);
                session.setAttribute("currentUser", current);
                out.write("{\"ok\":true}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"ok\":false,\"error\":\"db_update_failed\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            try (PrintWriter out = response.getWriter()) {
                out.write("{\"ok\":false,\"error\":\"exception\"}");
            }
        }
    }
}
