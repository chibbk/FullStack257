import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/announcementsFeed")
public class AnnouncementsServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");

        try (Connection conn = DBConnection.getConnection();
             PrintWriter out = response.getWriter()) {

            String sql = "SELECT id, user_id, title, body, category, created_at " +
                         "FROM posts WHERE category = 'Announcement' " +
                         "ORDER BY created_at DESC";

            StringBuilder sb = new StringBuilder();
            sb.append("[");

            try (PreparedStatement ps = conn.prepareStatement(sql);
                 ResultSet rs = ps.executeQuery()) {

                boolean first = true;
                while (rs.next()) {
                    if (!first) sb.append(",");
                    first = false;

                    long id = rs.getLong("id");
                    int userId = rs.getInt("user_id");
                    String title = rs.getString("title");
                    String body = rs.getString("body");
                    String cat = rs.getString("category");
                    String createdAt = rs.getTimestamp("created_at").toString();

                    sb.append("{")
                      .append("\"id\":").append(id).append(",")
                      .append("\"userId\":").append(userId).append(",")
                      .append("\"title\":").append(json(title)).append(",")
                      .append("\"body\":").append(json(body)).append(",")
                      .append("\"category\":").append(json(cat)).append(",")
                      .append("\"createdAt\":").append(json(createdAt))
                      .append("}");
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
