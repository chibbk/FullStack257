import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {

    private static final String URL =
        "jdbc:mysql://localhost:3306/webproject"
      + "?useUnicode=true&characterEncoding=utf8"
      + "&connectionCollation=utf8mb4_unicode_ci"
      + "&serverTimezone=UTC";

    private static final String USER = "root";
    private static final String PASSWORD = "Cjmk2025";

    public static Connection getConnection() throws SQLException {
    	return DriverManager.
    	getConnection(
    	URL,
    	USER,
    	PASSWORD);
    	}
    
    
}