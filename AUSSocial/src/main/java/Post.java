import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalTime;

public class Post {
    private long id;
    private int userId;

    private String title;
    private String body;
    private String category; //Question, Sell, Event, Announcement, Other

    private Double price;      //only for Sell
    private LocalDate eventDate; //only for Event
    private LocalTime eventTime;
    private String location;
    private String building;

    private String tags; 


    private Timestamp createdAt;
    private int likeCount;

    public Post() {}

    // Minimal constructor
    public Post(int userId, String title, String body, String category) {
        this.userId = userId;
        this.title = title;
        this.body = body;
        this.category = category;
    }

    // Getters & setters...

    public long getId() {
        return id;
    }
    public void setId(long id) {
        this.id = id;
    }

    public int getUserId() {
        return userId;
    }
    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }

    public String getBody() {
        return body;
    }
    public void setBody(String body) {
        this.body = body;
    }

    public String getCategory() {
        return category;
    }
    public void setCategory(String category) {
        this.category = category;
    }

    public Double getPrice() {
        return price;
    }
    public void setPrice(Double price) {
        this.price = price;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }
    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public LocalTime getEventTime() {
        return eventTime;
    }
    public void setEventTime(LocalTime eventTime) {
        this.eventTime = eventTime;
    }

    public String getLocation() {
        return location;
    }
    public void setLocation(String location) {
        this.location = location;
    }

    public String getBuilding() {
        return building;
    }
    public void setBuilding(String building) {
        this.building = building;
    }

    public String getTags() {
        return tags;
    }
    public void setTags(String tags) {
        this.tags = tags;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public int getLikeCount() {
        return likeCount;
    }
    public void setLikeCount(int likeCount) {
        this.likeCount = likeCount;
    }

    @Override
    public String toString() {
        return "Post{id=" + id +
               ", userId=" + userId +
               ", title='" + title + '\'' +
               ", category='" + category + '\'' +
               '}';
    }
}
