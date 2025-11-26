import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        String email = request.getParameter("email");
        String password = request.getParameter("password");

        if (email == null || password == null ||
            email.isBlank() || password.isBlank()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing fields");
            return;
        }

        try {
            UserDAO userDAO = new UserDAOImpl();
            User user = userDAO.login(email, password);

            if (user == null) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED,
                        "Invalid email or password.");
                return;
            }

            HttpSession session = request.getSession(true);
            session.setAttribute("currentUser", user);

            response.sendRedirect(request.getContextPath() + "/home.html");

        } catch (Exception e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Server error during login.");
        }
    }
}
