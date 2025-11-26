public class TestUserDAO {

    public static void main(String[] args) {
        try {
            UserDAO userDAO = new UserDAOImpl();

            // 1) create user
            User u = new User();
            u.setUsername("TestUser");
            u.setEmail("testuser@aus.edu");
            u.setPasswordHash(UserDAOImpl.hashPassword("1234"));
            u.setBio("Hello, this is my bio!");
            u.setProfilePicture(null);

            boolean created = userDAO.createUser(u);
            System.out.println("User created? " + created + " | id = " + u.getId());

            // 2) find by email
            User found = userDAO.findByEmail("testuser@aus.edu");
            System.out.println("Found: " + found);

            // 3) login
            User loggedIn = userDAO.login("testuser@aus.edu", "1234");
            System.out.println("Login success? " + (loggedIn != null));

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
