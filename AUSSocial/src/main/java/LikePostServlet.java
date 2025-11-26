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
import jakarta.servlet.http.HttpSession;

@WebServlet("/likePost")
public class LikePostServlet extends HttpServlet {

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

        try (Connection conn = DBConnection.getConnection()) {
            conn.setAutoCommit(false);

            // Check if like exists
            String checkSql = "SELECT 1 FROM post_likes WHERE user_id=? AND post_id=?";
            boolean alreadyLiked = false;
            try (PreparedStatement ps = conn.prepareStatement(checkSql)) {
                ps.setInt(1, currentUser.getId());
                ps.setLong(2, postId);
                try (ResultSet rs = ps.executeQuery()) {
                    alreadyLiked = rs.next();
                }
            }

            int likeChange = 0;

            if (alreadyLiked) {
                // Unlike
                String delSql = "DELETE FROM post_likes WHERE user_id=? AND post_id=?";
                try (PreparedStatement ps = conn.prepareStatement(delSql)) {
                    ps.setInt(1, currentUser.getId());
                    ps.setLong(2, postId);
                    ps.executeUpdate();
                }
                likeChange = -1;
            } else {
                // Like
                String insSql = "INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)";
                try (PreparedStatement ps = conn.prepareStatement(insSql)) {
                    ps.setInt(1, currentUser.getId());
                    ps.setLong(2, postId);
                    ps.executeUpdate();
                }
                likeChange = 1;
            }

            // Update like_count in posts
            String updSql = "UPDATE posts SET like_count = like_count + ? WHERE id = ?";
            try (PreparedStatement ps = conn.prepareStatement(updSql)) {
                ps.setInt(1, likeChange);
                ps.setLong(2, postId);
                ps.executeUpdate();
            }

            // Get new like_count
            int newCount = 0;
            String countSql = "SELECT like_count FROM posts WHERE id = ?";
            try (PreparedStatement ps = conn.prepareStatement(countSql)) {
                ps.setLong(1, postId);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        newCount = rs.getInt(1);
                    }
                }
            }

            conn.commit();

            try (PrintWriter out = response.getWriter()) {
                out.write("{\"success\":true,"
                        + "\"liked\":" + (!alreadyLiked) + ","
                        + "\"likeCount\":" + newCount + "}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            try (PrintWriter out = response.getWriter()) {
                out.write("{\"error\":\"Server error\"}");
            }
        }
    }
}
