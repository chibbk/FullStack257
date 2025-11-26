import java.io.IOException;
import java.io.PrintWriter;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet("/whoami")
public class WhoAmIServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");

        HttpSession session = request.getSession(false);
        User user = null;
        if (session != null) {
            Object obj = session.getAttribute("currentUser");
            if (obj instanceof User) {
                user = (User) obj;
            }
        }

        try (PrintWriter out = response.getWriter()) {
            if (user == null) {
                out.write("{\"authenticated\":false}");
            } else {
            	out.write("{"
            	        + "\"authenticated\":true,"
            	        + "\"id\":" + user.getId() + ","  // <--- add this
            	        + "\"name\":" + json(user.getUsername()) + ","
            	        + "\"email\":" + json(user.getEmail())
            	        + "}");

            }
        }
    }

    // You can reuse this helper from AnnouncementsServlet
    private String json(String s) {
        if (s == null) return "null";
        return "\"" + s
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r") + "\"";
    }
}
