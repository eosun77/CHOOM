package com.choom.domain.mydance.entity;

import com.choom.global.model.BaseTimeEntity;
import com.choom.domain.originaldance.entity.OriginalDance;
import com.choom.domain.user.entity.User;
import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MyDance extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column
    private int score;

    @NotNull
    @Column(columnDefinition = "TEXT")
    private String matchRate;

    @NotNull
    @Column(length = 2083, unique = true)
    private String videoPath;

    @NotNull
    @Column
    private double videoLength;

    @NotNull
    @Column(length = 100)
    private String title;

    @Column(length = 2083)
    private String youtubeUrl;

    @Column(length = 2083)
    private String tiktokUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORIGINALDANCE_ID")
    private OriginalDance originalDance;

    @Builder
    public MyDance(Long id, int score, String matchRate, String videoPath, double videoLength, String title, User user, OriginalDance originalDance) {
        this.id = id;
        this.score = score;
        this.matchRate = matchRate;
        this.videoPath = videoPath;
        this.videoLength = videoLength;
        this.title = title;
        this.user = user;
        this.originalDance = originalDance;
    }
}
