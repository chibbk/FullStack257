public interface UserDAO {

    boolean createUser(User user) throws Exception;

    User findByEmail(String email) throws Exception;

    /**
     * Returns the User if email+password are correct, otherwise null.
     */
    User login(String email, String plainPassword) throws Exception;

    boolean updateBio(int userId, String bio) throws Exception;

    boolean updateProfilePicture(int userId, String profilePath) throws Exception;
}
