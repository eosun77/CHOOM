package com.choom.domain.user.controller;

import com.choom.domain.user.dto.AccessTokenDto;
import com.choom.domain.user.dto.TokenDto;
import com.choom.domain.user.dto.UserDetailsDto;
import com.choom.domain.user.service.AuthService;
import com.choom.domain.user.service.UserService;
import com.choom.global.auth.CustomUserDetails;
import com.choom.global.model.BaseResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import springfox.documentation.annotations.ApiIgnore;

import java.io.IOException;

@Slf4j
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final AuthService authService;
    private final UserService userService;

    @GetMapping()
    public ResponseEntity<BaseResponse> userDetails(@ApiIgnore Authentication authentication, @RequestParam(required = false) Long userId) {
        log.info("userDetails 요청");
        if (userId != null) {
            UserDetailsDto userDetailsDto = userService.findUserDetails(userId);
            return new ResponseEntity<>(BaseResponse.success(userDetailsDto), HttpStatus.OK);
        }
        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getDetails();
        Long authenticatedUserId = customUserDetails.getUserId();
        UserDetailsDto userDetailsDto = userService.findUserDetails(authenticatedUserId);
        return new ResponseEntity<>(BaseResponse.success(userDetailsDto), HttpStatus.OK);
    }

    @PutMapping()
    public ResponseEntity<BaseResponse> modifyUser(@ApiIgnore Authentication authentication, @RequestPart(required = false) String nickname,
                                                   @RequestPart(required = false) MultipartFile profileImage) throws IOException {
        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getDetails();
        Long userId = customUserDetails.getUserId();
        if (nickname != null) {
            userService.modifyUserNickname(userId, nickname);
        }
        if (profileImage != null) {
            userService.modifyUserProfileImage(userId, profileImage);
        }
        return new ResponseEntity<>(BaseResponse.success(null), HttpStatus.OK);
    }

    @DeleteMapping()
    public ResponseEntity<BaseResponse> deleteUser(@ApiIgnore Authentication authentication, @ApiIgnore @RequestHeader("Authorization") String token) throws IOException {
        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getDetails();
        Long userId = customUserDetails.getUserId();
        String accessToken = token.substring(7);
        String refreshToken = authService.logout(userId, accessToken);
        authService.deleteUser(userId);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Set-Cookie", authService.setCookie(refreshToken, 0).toString());
        return new ResponseEntity<>(BaseResponse.success(null), headers, HttpStatus.OK);
    }

    @GetMapping("/login/kakao")
    public ResponseEntity<BaseResponse> kakaoLogin(@RequestParam String code, @Value("${jwt.expiration.rtk}") Integer expiration) {
        TokenDto token = authService.socialLogin("KAKAO", code);
        HttpHeaders headers = new HttpHeaders();
        ResponseCookie cookie = authService.setCookie(token.getRefreshToken(), expiration);
        headers.add("Set-Cookie", cookie.toString());
        log.info("cookie : " + cookie.toString());
        AccessTokenDto accessTokenDto = new AccessTokenDto(token.getAccessToken());
        return new ResponseEntity<>(BaseResponse.success(accessTokenDto), headers, HttpStatus.OK);
    }

    @GetMapping("/login/google")
    public ResponseEntity<BaseResponse> googleLogin(@RequestParam String code, @Value("${jwt.expiration.rtk}") Integer expiration) throws IOException {
        TokenDto token = authService.socialLogin("GOOGLE", code);
        HttpHeaders headers = new HttpHeaders();
        ResponseCookie cookie = authService.setCookie(token.getRefreshToken(), expiration);
        headers.add("Set-Cookie", cookie.toString());
        log.info("cookie : " + cookie.toString());
        AccessTokenDto accessTokenDto = new AccessTokenDto(token.getAccessToken());
        return new ResponseEntity<>(BaseResponse.success(accessTokenDto), headers, HttpStatus.OK);
    }

    @PostMapping("/login/token")
    public ResponseEntity<BaseResponse> reissueToken(@CookieValue("refreshToken") String refreshToken, @Value("${jwt.expiration.rtk}") Integer expiration) {
        log.info("Cookie로 받은 refreshToken : " + refreshToken);
        TokenDto token = authService.reissueToken(refreshToken);
        if (token == null) {
            return new ResponseEntity<>(BaseResponse.custom(401, "토큰 재발급에 실패했습니다.", null), HttpStatus.UNAUTHORIZED);
        }
        HttpHeaders headers = new HttpHeaders();
        ResponseCookie cookie = authService.setCookie(token.getRefreshToken(), expiration);
        headers.add("Set-Cookie", cookie.toString());
        log.info("cookie 재발급 : " + cookie.toString());
        AccessTokenDto accessTokenDto = new AccessTokenDto(token.getAccessToken());
        return new ResponseEntity<>(BaseResponse.success(accessTokenDto), headers, HttpStatus.OK);
    }

    @PostMapping("/logout")
    public ResponseEntity<BaseResponse> logout(@ApiIgnore Authentication authentication, @ApiIgnore @RequestHeader("Authorization") String token) {
        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getDetails();
        Long userId = customUserDetails.getUserId();
        String accessToken = token.substring(7);
        String refreshToken = authService.logout(userId, accessToken);
        HttpHeaders headers = new HttpHeaders();
        ResponseCookie cookie = authService.setCookie(refreshToken, 0);
        headers.add("Set-Cookie", cookie.toString());
        log.info("delete cookie : " + cookie.toString());
        return new ResponseEntity<>(BaseResponse.success(null), headers, HttpStatus.OK);
    }

    @GetMapping("/nickname/{nickname}")
    public ResponseEntity<BaseResponse> checkNickname(@PathVariable String nickname) {
        boolean isNicknameAvailable = userService.isNicknameAvailable(nickname);
        if (isNicknameAvailable) {
            return new ResponseEntity<>(BaseResponse.success(null), HttpStatus.OK);
        }
        return new ResponseEntity<>(BaseResponse.custom(409, "이미 존재하는 닉네임입니다.", null), HttpStatus.CONFLICT);
    }
}
