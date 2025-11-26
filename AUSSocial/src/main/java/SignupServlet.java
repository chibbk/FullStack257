import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet("/signup")
public class SignupServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        String username = request.getParameter("username");
        if (username == null || username.isBlank()) {
            // your existing form uses "name"
            username = request.getParameter("name");
        }
        String email = request.getParameter("email");
        String password = request.getParameter("password");

        if (username == null || email == null || password == null ||
            username.isBlank() || email.isBlank() || password.isBlank()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing fields");
            return;
        }

        try {
            UserDAO userDAO = new UserDAOImpl();

            User existing = userDAO.findByEmail(email);
            if (existing != null) {
                response.sendError(HttpServletResponse.SC_CONFLICT,
                        "An account with this email already exists.");
                return;
            }

            User u = new User();
            u.setUsername(username);
            u.setEmail(email);
            u.setPasswordHash(UserDAOImpl.hashPassword(password));

            boolean created = userDAO.createUser(u);
            if (!created) {
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                        "Could not create user.");
                return;
            }

            HttpSession session = request.getSession(true);
            session.setAttribute("currentUser", u);

            response.sendRedirect("home.html?justSignedUp=1");

        } catch (Exception e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Server error during signup.");
        }
    }
}
