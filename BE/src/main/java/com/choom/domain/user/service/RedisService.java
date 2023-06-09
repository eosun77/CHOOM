package com.choom.domain.user.service;

import com.choom.domain.user.entity.BlacklistRedisRepository;
import com.choom.domain.user.entity.RefreshToken;
import com.choom.domain.user.entity.RefreshTokenRedisRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RedisService {

    private final RefreshTokenRedisRepository refreshTokenRedisRepository;

    @Transactional
    public void saveToken(Long userId, String refreshToken) {
        RefreshToken token = refreshTokenRedisRepository.findById(userId).orElse(null);
        if (token != null) {
            deleteToken(token);
        }
        refreshTokenRedisRepository.save(RefreshToken.builder()
                .userId(userId)
                .token(refreshToken)
                .build());
    }

    @Transactional
    public String deleteToken(RefreshToken token) {
        try {
            String refreshToken = token.getToken();
            refreshTokenRedisRepository.delete(token);
            return refreshToken;
        } catch (Exception e) {
            log.error(e.getMessage());
        }
        return null;
    }
}
