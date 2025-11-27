import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet("/createPost")
public class CreatePostServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        HttpSession session = request.getSession(false);
        User currentUser = (session != null) ? (User) session.getAttribute("currentUser") : null;
        if (currentUser == null) {
            // not logged in
            response.sendRedirect(request.getContextPath() + "/index.html");
            return;
        }

        String title = request.getParameter("title");
        String body = request.getParameter("body");
        String category = request.getParameter("category");
        String priceStr = request.getParameter("price");
        String eventDateStr = request.getParameter("eventDate");
        String eventTimeStr = request.getParameter("eventTime");
        String location = request.getParameter("location");
        String building = request.getParameter("building");
        String tags = request.getParameter("tags"); // e.g. "tag1,tag2"

        if (title == null || body == null || category == null ||
            title.isBlank() || body.isBlank() || category.isBlank()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing required fields.");
            return;
        }

        try {
            Post post = new Post(currentUser.getId(), title, body, category);

            // optional fields
            if (priceStr != null && !priceStr.isBlank()) {
                try {
                    post.setPrice(Double.parseDouble(priceStr));
                } catch (NumberFormatException ignored) {}
            }

            if (eventDateStr != null && !eventDateStr.isBlank()) {
                post.setEventDate(LocalDate.parse(eventDateStr)); // expects yyyy-MM-dd
            }

            if (eventTimeStr != null && !eventTimeStr.isBlank()) {
                post.setEventTime(LocalTime.parse(eventTimeStr)); // expects HH:mm
            }

            post.setLocation(location);
            post.setBuilding(building);
            post.setTags(tags);

            PostDAO postDAO = new PostDAOImpl();
            boolean created = postDAO.createPost(post);

            if (!created) {
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                        "Could not create post.");
                return;
            }

            // redirect depending on category (like your CreateScript.js)
            String redirectPage = "index.html";
            if ("Announcement".equalsIgnoreCase(category)) {
                redirectPage = "announcements.html";
            }

            response.sendRedirect(request.getContextPath() + "/" + redirectPage);

        } catch (Exception e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Server error while creating post.");
        }
    }
}
