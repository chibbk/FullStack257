import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet("/addComment")
public class AddCommentServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
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

        String postIdStr = request.getParameter("postId");
        String text = request.getParameter("text");

        if (postIdStr == null || postIdStr.isBlank() || text == null || text.isBlank()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            try (PrintWriter out = response.getWriter()) {
                out.write("{\"error\":\"Missing postId or text\"}");
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

        try (Connection conn = DBConnection.getConnection()) {
            String sql = "INSERT INTO comments (post_id, user_id, text, created_at) VALUES (?, ?, ?, NOW())";
            long commentId = 0;
            Timestamp createdAt = null;

            try (PreparedStatement ps = conn.prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS)) {
                ps.setLong(1, postId);
                ps.setInt(2, currentUser.getId());
                ps.setString(3, text);
                ps.executeUpdate();

                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        commentId = rs.getLong(1);
                    }
                }
            }

            // Fetch created_at for that comment
            String sel = "SELECT created_at FROM comments WHERE id = ?";
            try (PreparedStatement ps = conn.prepareStatement(sel)) {
                ps.setLong(1, commentId);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        createdAt = rs.getTimestamp(1);
                    }
                }
            }

            try (PrintWriter out = response.getWriter()) {
                out.write("{\"success\":true,"
                        + "\"id\":" + commentId + ","
                        + "\"authorName\":" + json(currentUser.getUsername()) + ","
                        + "\"text\":" + json(text) + ","
                        + "\"createdAt\":" + json(createdAt != null ? createdAt.toString() : null)
                        + "}");
            }

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
