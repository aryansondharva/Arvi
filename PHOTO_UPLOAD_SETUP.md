# Photo Upload Setup Guide

## Overview
This guide explains how to set up photo upload functionality for user avatars in EcoVolunteer PRO.

## 🎯 Features Implemented

### Photo Upload Functionality
- **File Types**: JPG, PNG, GIF, WebP
- **File Size Limit**: 2MB maximum
- **Storage**: Supabase Storage with automatic organization
- **Security**: User-specific folders with access policies
- **UI**: Integrated upload button with loading states

### Storage Structure
- **Bucket**: `avatars`
- **File Path**: `{userId}/avatar.{ext}`
- **Public Access**: Avatars are publicly viewable
- **Private Upload**: Only users can upload their own avatars

## 📁 Files Created/Modified

### 1. Storage Bucket Script
- **File**: `scripts/009-create-avatar-bucket.sql`
- **Purpose**: Creates storage bucket and security policies
- **Features**:
  - Creates `avatars` bucket with 2MB limit
  - Sets up user-specific upload permissions
  - Enables public viewing of avatars
  - Restricts upload to authenticated users

### 2. Profile Settings Component
- **File**: `components/profile-settings.tsx`
- **Changes Made**:
  - Added file input with hidden element
  - Implemented `handleAvatarUpload` function
  - Added file validation (type and size)
  - Integrated Supabase Storage upload
  - Added loading states and error handling
  - Updated UI with upload button

## 🚀 Setup Instructions

### Step 1: Run Storage Bucket Script
1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste contents of `scripts/009-create-avatar-bucket.sql`
4. Execute the script

**What this does:**
- Creates `avatars` storage bucket
- Sets up security policies for user access
- Configures public viewing permissions
- Limits file types and sizes

### Step 2: Verify Bucket Creation
After running the script:

1. **Check bucket exists**:
```sql
SELECT * FROM storage.buckets WHERE name = 'avatars';
```

2. **Check policies**:
```sql
SELECT * FROM storage.policies WHERE bucket_id = 'avatars';
```

### Step 3: Test Photo Upload
1. Go to `/dashboard/profile`
2. Click "Change Avatar" button
3. Select an image file (JPG, PNG, GIF, WebP)
4. Verify upload progress and success message
5. Check that avatar updates in profile

## 🔧 Technical Details

### File Upload Process
1. **File Selection**: User clicks upload button
2. **Validation**: File type and size checked
3. **Upload**: File uploaded to Supabase Storage
4. **URL Generation**: Public URL generated
5. **Profile Update**: Avatar URL saved to profile
6. **UI Refresh**: Profile updates with new avatar

### Storage Policies
```sql
-- Users can upload to their own folder
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

### File Organization
- **Path Structure**: `{userId}/avatar.{ext}`
- **Example**: `123e4567-e89b-12d3-a456-426614174000/avatar.jpg`
- **Upsert**: Existing files are replaced
- **Public URL**: Automatically generated for viewing

## 🎨 UI Features

### Upload Button States
1. **Default**: "Change Avatar" with upload icon
2. **Loading**: "Uploading..." with spinning loader
3. **Disabled**: Button disabled during upload

### Error Handling
- **Invalid File Type**: Shows error toast
- **File Too Large**: Shows size limit error
- **Upload Failed**: Shows specific error message
- **Success**: Shows success confirmation

### File Validation
```javascript
// File type validation
if (!file.type.startsWith('image/')) {
  // Show error
}

// File size validation (2MB)
if (file.size > 2 * 1024 * 1024) {
  // Show error
}
```

## 🧪 Testing

### Test Cases
1. **Valid Upload**:
   - Select JPG/PNG/GIF under 2MB
   - Verify upload success
   - Check avatar updates

2. **Invalid File Type**:
   - Try uploading PDF or text file
   - Verify error message appears

3. **File Too Large**:
   - Try uploading file > 2MB
   - Verify size error message

4. **Upload Progress**:
   - Monitor loading state
   - Verify button disabled during upload

5. **Avatar Display**:
   - Check avatar appears in profile
   - Verify avatar appears in navigation
   - Test leaderboard display

## 🔒 Security Features

### Access Control
- **Authenticated Upload**: Only logged-in users can upload
- **User-Specific**: Users can only upload to their own folder
- **Public Viewing**: Anyone can view uploaded avatars
- **File Type Restriction**: Only image files allowed

### Storage Policies
1. **Upload Policy**: Users can upload to their own folder
2. **Update Policy**: Users can update their own files
3. **View Policy**: Public access for viewing
4. **Size Limit**: 2MB maximum file size

## 🐛 Troubleshooting

### Common Issues

#### 1. Upload Fails
- **Cause**: Storage bucket not created
- **Solution**: Run `009-create-avatar-bucket.sql`

#### 2. Permission Denied
- **Cause**: Storage policies not applied
- **Solution**: Check policies in Supabase dashboard

#### 3. File Too Large
- **Cause**: File exceeds 2MB limit
- **Solution**: Compress image or use smaller file

#### 4. Invalid File Type
- **Cause**: Non-image file selected
- **Solution**: Use JPG, PNG, GIF, or WebP

#### 5. Avatar Not Updating
- **Cause**: Profile not refreshed
- **Solution**: Check `router.refresh()` call

### Debug Queries

```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE name = 'avatars';

-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'avatars';

-- Check uploaded files
SELECT * FROM storage.objects WHERE bucket_id = 'avatars';
```

### Client-Side Debugging

```javascript
// Check file details
console.log('File type:', file.type);
console.log('File size:', file.size);
console.log('File name:', file.name);

// Check upload response
console.log('Upload result:', uploadResult);
console.log('Public URL:', publicUrl);
```

## 📈 Performance Considerations

### Optimization Tips
1. **Image Compression**: Compress images before upload
2. **File Formats**: Use WebP for better compression
3. **Caching**: Leverage browser caching for avatars
4. **CDN**: Supabase provides CDN for storage

### Storage Costs
- **Free Tier**: Supabase includes storage limits
- **Compression**: Reduces storage costs
- **Cleanup**: Consider old file cleanup

## 🔄 Future Enhancements

### Potential Features
1. **Image Cropping**: Built-in image editor
2. **Multiple Avatars**: Allow multiple profile pictures
3. **Avatar History**: Keep backup of old avatars
4. **Bulk Upload**: Upload multiple images
5. **Social Sharing**: Share avatar on social media

### Advanced Features
1. **AI Enhancement**: Auto-enhance uploaded images
2. **Background Removal**: Remove image backgrounds
3. **Avatar Frames**: Add decorative frames
4. **Animated Avatars**: Support GIF avatars
5. **Avatar Gallery**: Display multiple avatar options

---

**Photo Upload Setup Complete!** 📸

Your EcoVolunteer PRO platform now has comprehensive photo upload functionality with secure storage, file validation, and seamless integration into the user profile system.
