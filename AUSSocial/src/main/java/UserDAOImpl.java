import java.sql.*;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class UserDAOImpl implements UserDAO {

    @Override
    public boolean createUser(User user) throws Exception {
        String sql = "INSERT INTO users (username, email, password_hash, bio, profile_picture) " +
                     "VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, user.getUsername());
            ps.setString(2, user.getEmail());
            ps.setString(3, user.getPasswordHash());
            ps.setString(4, user.getBio());
            ps.setString(5, user.getProfilePicture());

            int rows = ps.executeUpdate();
            if (rows == 0) return false;

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    user.setId(rs.getInt(1));
                }
            }
            return true;
        }
    }

    @Override
    public User findByEmail(String email) throws Exception {
        String sql = "SELECT id, username, email, password_hash, bio, profile_picture " +
                     "FROM users WHERE email = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, email);

            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) return null;

                User u = new User();
                u.setId(rs.getInt("id"));
                u.setUsername(rs.getString("username"));
                u.setEmail(rs.getString("email"));
                u.setPasswordHash(rs.getString("password_hash"));
                u.setBio(rs.getString("bio"));
                u.setProfilePicture(rs.getString("profile_picture"));
                return u;
            }
        }
    }

    @Override
    public User login(String email, String plainPassword) throws Exception {
        User u = findByEmail(email);
        if (u == null) return null;

        String hash = hashPassword(plainPassword);
        if (!hash.equals(u.getPasswordHash())) {
            return null;
        }
        return u;
    }

    @Override
    public boolean updateBio(int userId, String bio) throws Exception {
        String sql = "UPDATE users SET bio = ? WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, bio);
            ps.setInt(2, userId);
            return ps.executeUpdate() > 0;
        }
    }

    @Override
    public boolean updateProfilePicture(int userId, String profilePath) throws Exception {
        String sql = "UPDATE users SET profile_picture = ? WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, profilePath);
            ps.setInt(2, userId);
            return ps.executeUpdate() > 0;
        }
    }

    // Simple SHA-256 hashing for passwords
    public static String hashPassword(String plain) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] bytes = md.digest(plain.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("No SHA-256 support", e);
        }
    }
}
