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

@WebServlet("/comments")
public class CommentsServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");

        String postIdStr = request.getParameter("postId");
        if (postIdStr == null || postIdStr.isBlank()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            try (PrintWriter out = response.getWriter()) {
                out.write("{\"error\":\"Missing postId\"}");
            }
            return;
        }

        long postId;
        try {
            postId = Long.parseLong(postIdStr);
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            try (PrintWriter out = response.getWriter()) {
                out.write("{\"error\":\"Invalid postId\"}");
            }
            return;
        }

        try (Connection conn = DBConnection.getConnection();
             PrintWriter out = response.getWriter()) {

            String sql = "SELECT c.id, c.text, c.created_at, u.username " +
                         "FROM comments c JOIN users u ON c.user_id = u.id " +
                         "WHERE c.post_id = ? ORDER BY c.created_at ASC";

            StringBuilder sb = new StringBuilder();
            sb.append("[");

            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setLong(1, postId);
                try (ResultSet rs = ps.executeQuery()) {
                    boolean first = true;
                    while (rs.next()) {
                        if (!first) sb.append(",");
                        first = false;

                        long id = rs.getLong("id");
                        String text = rs.getString("text");
                        String userName = rs.getString("username");
                        String createdAt = rs.getTimestamp("created_at").toString();

                        sb.append("{")
                          .append("\"id\":").append(id).append(",")
                          .append("\"authorName\":").append(json(userName)).append(",")
                          .append("\"text\":").append(json(text)).append(",")
                          .append("\"createdAt\":").append(json(createdAt))
                          .append("}");
                    }
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
