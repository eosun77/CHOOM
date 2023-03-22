package com.choom.domain.mydance.dto;

import com.choom.domain.mydance.entity.MyDance;
import lombok.*;

import java.time.format.DateTimeFormatter;

@Getter
@ToString
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FindMyDanceResponseDto {
    private Long id;
    private Long originalDanceId;
    private int score;
    private String matchRate;
    private String videoPath;
    private double videoLength;
    private String title;
    private String youtubeUrl;
    private String tiktokUrl;
    private String created;

    @Builder
    public FindMyDanceResponseDto(MyDance myDance) {
        this.id = myDance.getId();
        this.originalDanceId = myDance.getOriginalDance().getId();
        this.score = myDance.getScore();
        this.matchRate = myDance.getMatchRate();
        this.videoPath = myDance.getVideoPath();
        this.videoLength = myDance.getVideoLength();
        this.title = myDance.getTitle();
        this.youtubeUrl = myDance.getYoutubeUrl();
        this.tiktokUrl = myDance.getTiktokUrl();
        this.created = myDance.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy.MM.dd"));;
    }
}
