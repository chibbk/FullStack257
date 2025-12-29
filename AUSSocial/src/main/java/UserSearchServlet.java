import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/searchUsers")
public class UserSearchServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAOImpl();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String q = request.getParameter("q");
        if (q == null) q = "";
        q = q.trim();

        response.setContentType("application/json;charset=UTF-8");

        try (PrintWriter out = response.getWriter()) {
            if (q.isEmpty()) {
                out.write("[]");
                return;
            }

            List<User> users = userDAO.searchByUsername(q);

            //bulids a small JSON array: [{ "id": 1, "username": "TestUser" }, ...]
            StringBuilder sb = new StringBuilder();
            sb.append("[");

            for (int i = 0; i < users.size(); i++) {
                User u = users.get(i);

                sb.append("{")
                  .append("\"id\":").append(u.getId()).append(",")
                  .append("\"username\":").append(json(u.getUsername()))
                  .append("}");

                if (i < users.size() - 1) {
                    sb.append(",");
                }
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
