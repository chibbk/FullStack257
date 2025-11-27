import java.sql.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class PostDAOImpl implements PostDAO {

    @Override
    public boolean createPost(Post post) throws Exception {
        String sql = "INSERT INTO posts (" +
                "user_id, title, body, category, price, event_date, event_time, " +
                "location, building, tags" +
                ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, post.getUserId());
            ps.setString(2, post.getTitle());
            ps.setString(3, post.getBody());
            ps.setString(4, post.getCategory());

            if (post.getPrice() != null) {
                ps.setDouble(5, post.getPrice());
            } else {
                ps.setNull(5, Types.DECIMAL);
            }

            if (post.getEventDate() != null) {
                ps.setDate(6, Date.valueOf(post.getEventDate()));
            } else {
                ps.setNull(6, Types.DATE);
            }

            if (post.getEventTime() != null) {
                ps.setTime(7, Time.valueOf(post.getEventTime()));
            } else {
                ps.setNull(7, Types.TIME);
            }

            ps.setString(8, post.getLocation());
            ps.setString(9, post.getBuilding());
            ps.setString(10, post.getTags());

            int rows = ps.executeUpdate();
            if (rows == 0) return false;

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    post.setId(rs.getLong(1));
                }
            }
            return true;
        }
    }

    @Override
    public Post findById(long id) throws Exception {
        String sql = "SELECT * FROM posts WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setLong(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) return null;
                return mapRow(rs);
            }
        }
    }

    @Override
    public List<Post> findByUser(int userId) throws Exception {
        String sql = "SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC";
        List<Post> list = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
            }
        }
        return list;
    }

    @Override
    public List<Post> findAllForFeed() throws Exception {
        String sql = "SELECT * FROM posts ORDER BY created_at DESC";
        List<Post> list = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                list.add(mapRow(rs));
            }
        }
        return list;
    }

    @Override
    public boolean deletePost(long postId, int userId) throws Exception {
        String sql = "DELETE FROM posts WHERE id = ? AND user_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setLong(1, postId);
            ps.setInt(2, userId);

            int rows = ps.executeUpdate();
            return rows > 0;
        }
    }

    // Helper: map a row into a Post object
    private Post mapRow(ResultSet rs) throws SQLException {
        Post p = new Post();
        p.setId(rs.getLong("id"));
        p.setUserId(rs.getInt("user_id"));
        p.setTitle(rs.getString("title"));
        p.setBody(rs.getString("body"));
        p.setCategory(rs.getString("category"));

        double price = rs.getDouble("price");
        if (!rs.wasNull()) {
            p.setPrice(price);
        }

        Date d = rs.getDate("event_date");
        if (d != null) {
            p.setEventDate(d.toLocalDate());
        }

        Time t = rs.getTime("event_time");
        if (t != null) {
            p.setEventTime(t.toLocalTime());
        }

        p.setLocation(rs.getString("location"));
        p.setBuilding(rs.getString("building"));
        p.setTags(rs.getString("tags"));
        p.setCreatedAt(rs.getTimestamp("created_at"));
        p.setLikeCount(rs.getInt("like_count"));

        return p;
    }
}
